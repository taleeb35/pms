
-- Sales Invoice Returns / Refunds
CREATE TABLE public.inventory_invoice_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.inventory_invoices(id) ON DELETE CASCADE,
  return_number text NOT NULL,
  return_date date NOT NULL DEFAULT CURRENT_DATE,
  total_refund numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, return_number)
);

CREATE INDEX idx_inv_returns_invoice ON public.inventory_invoice_returns(invoice_id);
CREATE INDEX idx_inv_returns_clinic ON public.inventory_invoice_returns(clinic_id);

ALTER TABLE public.inventory_invoice_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic returns" ON public.inventory_invoice_returns
  USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

CREATE TABLE public.inventory_invoice_return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES public.inventory_invoice_returns(id) ON DELETE CASCADE,
  invoice_item_id uuid REFERENCES public.inventory_invoice_items(id) ON DELETE SET NULL,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE RESTRICT,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_return_items_return ON public.inventory_invoice_return_items(return_id);

ALTER TABLE public.inventory_invoice_return_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic return items" ON public.inventory_invoice_return_items
  USING (EXISTS (SELECT 1 FROM public.inventory_invoice_returns r
                 WHERE r.id = inventory_invoice_return_items.return_id
                   AND public.can_manage_clinic_inventory(r.clinic_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.inventory_invoice_returns r
                 WHERE r.id = inventory_invoice_return_items.return_id
                   AND public.can_manage_clinic_inventory(r.clinic_id)));

CREATE OR REPLACE FUNCTION public.generate_inventory_return_number(_clinic_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(return_number, '\D', '', 'g'), '')::int), 0) + 1
    INTO _next
  FROM public.inventory_invoice_returns
  WHERE clinic_id = _clinic_id;
  RETURN 'RET-' || LPAD(_next::text, 4, '0');
END;$$;

-- Process a return: items = jsonb array of { invoice_item_id, quantity }
CREATE OR REPLACE FUNCTION public.return_sales_invoice(
  _invoice_id uuid,
  _items jsonb,
  _notes text DEFAULT NULL,
  _return_date date DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _inv RECORD;
  _line jsonb;
  _inv_item RECORD;
  _qty numeric(12,2);
  _already_returned numeric(12,2);
  _max_returnable numeric(12,2);
  _ret_id uuid;
  _ret_no text;
  _batch_id uuid;
  _total_refund numeric(12,2) := 0;
  _line_total numeric(12,2);
BEGIN
  SELECT * INTO _inv FROM public.inventory_invoices WHERE id = _invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT public.can_manage_clinic_inventory(_inv.clinic_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _inv.status <> 'issued' THEN
    RAISE EXCEPTION 'Only issued invoices can be returned';
  END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'No items to return';
  END IF;

  _ret_no := public.generate_inventory_return_number(_inv.clinic_id);

  INSERT INTO public.inventory_invoice_returns (
    clinic_id, invoice_id, return_number, return_date, notes, created_by, total_refund
  ) VALUES (
    _inv.clinic_id, _inv.id, _ret_no, COALESCE(_return_date, CURRENT_DATE), _notes, auth.uid(), 0
  ) RETURNING id INTO _ret_id;

  FOR _line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := COALESCE((_line->>'quantity')::numeric, 0);
    IF _qty <= 0 THEN CONTINUE; END IF;

    SELECT * INTO _inv_item FROM public.inventory_invoice_items
      WHERE id = (_line->>'invoice_item_id')::uuid AND invoice_id = _invoice_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invoice line not found'; END IF;

    SELECT COALESCE(SUM(quantity), 0) INTO _already_returned
      FROM public.inventory_invoice_return_items
      WHERE invoice_item_id = _inv_item.id;

    _max_returnable := _inv_item.quantity - _already_returned;
    IF _qty > _max_returnable THEN
      RAISE EXCEPTION 'Cannot return % units of this line; only % remaining', _qty, _max_returnable;
    END IF;

    _line_total := _qty * _inv_item.unit_price;
    _total_refund := _total_refund + _line_total;

    -- restock to a return batch
    INSERT INTO public.inventory_batches (
      clinic_id, product_id, batch_number, quantity_received, quantity_on_hand
    ) VALUES (
      _inv.clinic_id, _inv_item.product_id,
      'RET-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || substr(md5(random()::text),1,4),
      _qty, _qty
    ) RETURNING id INTO _batch_id;

    INSERT INTO public.inventory_invoice_return_items (
      return_id, invoice_item_id, product_id, quantity, unit_price, line_total
    ) VALUES (
      _ret_id, _inv_item.id, _inv_item.product_id, _qty, _inv_item.unit_price, _line_total
    );

    INSERT INTO public.inventory_stock_ledger (
      clinic_id, product_id, batch_id, change_qty, reason,
      reference_type, reference_id, notes, created_by
    ) VALUES (
      _inv.clinic_id, _inv_item.product_id, _batch_id, _qty, 'return',
      'invoice_return', _ret_id, _notes, auth.uid()
    );
  END LOOP;

  IF _total_refund <= 0 THEN
    RAISE EXCEPTION 'Return must include at least one item with positive quantity';
  END IF;

  UPDATE public.inventory_invoice_returns SET total_refund = _total_refund WHERE id = _ret_id;
  RETURN _ret_id;
END;$$;
