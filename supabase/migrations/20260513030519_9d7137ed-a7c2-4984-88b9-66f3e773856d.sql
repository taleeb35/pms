
-- =========================================================
-- INVENTORY MANAGEMENT SYSTEM
-- =========================================================

-- Helper: is current user owner OR active receptionist of clinic
CREATE OR REPLACE FUNCTION public.can_manage_clinic_inventory(_clinic_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    auth.uid() = _clinic_id
    OR EXISTS (
      SELECT 1 FROM public.clinic_receptionists
      WHERE user_id = auth.uid()
        AND clinic_id = _clinic_id
        AND status = 'active'
    );
$$;

-- =========================================================
-- SUPPLIERS
-- =========================================================
CREATE TABLE public.inventory_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_suppliers_clinic ON public.inventory_suppliers(clinic_id);
ALTER TABLE public.inventory_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic suppliers" ON public.inventory_suppliers
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));
CREATE TRIGGER trg_inv_suppliers_updated BEFORE UPDATE ON public.inventory_suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PRODUCTS (medicines / consumables)
-- =========================================================
CREATE TABLE public.inventory_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  category text,
  unit text NOT NULL DEFAULT 'unit',
  sale_price numeric(12,2) NOT NULL DEFAULT 0,
  reorder_level numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_products_clinic ON public.inventory_products(clinic_id);
CREATE INDEX idx_inv_products_name ON public.inventory_products(clinic_id, lower(name));
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic products" ON public.inventory_products
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));
CREATE TRIGGER trg_inv_products_updated BEFORE UPDATE ON public.inventory_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PURCHASE ORDERS
-- =========================================================
CREATE TYPE public.po_status AS ENUM ('draft','ordered','received','cancelled');

CREATE TABLE public.inventory_purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.inventory_suppliers(id) ON DELETE SET NULL,
  po_number text NOT NULL,
  status public.po_status NOT NULL DEFAULT 'draft',
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date,
  received_date date,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, po_number)
);
CREATE INDEX idx_inv_po_clinic ON public.inventory_purchase_orders(clinic_id);
CREATE INDEX idx_inv_po_supplier ON public.inventory_purchase_orders(supplier_id);
ALTER TABLE public.inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic POs" ON public.inventory_purchase_orders
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));
CREATE TRIGGER trg_inv_po_updated BEFORE UPDATE ON public.inventory_purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inventory_purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.inventory_purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE RESTRICT,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  batch_number text,
  expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_po_items_po ON public.inventory_purchase_order_items(po_id);
ALTER TABLE public.inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic PO items" ON public.inventory_purchase_order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.inventory_purchase_orders po
    WHERE po.id = po_id AND public.can_manage_clinic_inventory(po.clinic_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.inventory_purchase_orders po
    WHERE po.id = po_id AND public.can_manage_clinic_inventory(po.clinic_id)
  ));

-- =========================================================
-- BATCHES (stock units)
-- =========================================================
CREATE TABLE public.inventory_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  po_id uuid REFERENCES public.inventory_purchase_orders(id) ON DELETE SET NULL,
  batch_number text,
  expiry_date date,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  quantity_received numeric(12,2) NOT NULL DEFAULT 0,
  quantity_on_hand numeric(12,2) NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_batches_clinic ON public.inventory_batches(clinic_id);
CREATE INDEX idx_inv_batches_product ON public.inventory_batches(product_id);
CREATE INDEX idx_inv_batches_expiry ON public.inventory_batches(clinic_id, expiry_date);
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic batches" ON public.inventory_batches
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

-- =========================================================
-- SALES INVOICES
-- =========================================================
CREATE TYPE public.inv_invoice_status AS ENUM ('draft','issued','cancelled');

CREATE TABLE public.inventory_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  status public.inv_invoice_status NOT NULL DEFAULT 'draft',
  customer_name text,
  customer_phone text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, invoice_number)
);
CREATE INDEX idx_inv_inv_clinic ON public.inventory_invoices(clinic_id);
ALTER TABLE public.inventory_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic invoices" ON public.inventory_invoices
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));
CREATE TRIGGER trg_inv_inv_updated BEFORE UPDATE ON public.inventory_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inventory_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.inventory_invoices(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE RESTRICT,
  batch_id uuid REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_inv_items_inv ON public.inventory_invoice_items(invoice_id);
ALTER TABLE public.inventory_invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic invoice items" ON public.inventory_invoice_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.inventory_invoices i
    WHERE i.id = invoice_id AND public.can_manage_clinic_inventory(i.clinic_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.inventory_invoices i
    WHERE i.id = invoice_id AND public.can_manage_clinic_inventory(i.clinic_id)
  ));

-- =========================================================
-- STOCK LEDGER
-- =========================================================
CREATE TABLE public.inventory_stock_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
  change_qty numeric(12,2) NOT NULL,
  reason text NOT NULL,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_ledger_clinic ON public.inventory_stock_ledger(clinic_id, created_at DESC);
CREATE INDEX idx_inv_ledger_product ON public.inventory_stock_ledger(product_id);
ALTER TABLE public.inventory_stock_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own clinic ledger" ON public.inventory_stock_ledger
  FOR SELECT USING (public.can_manage_clinic_inventory(clinic_id));
CREATE POLICY "insert own clinic ledger" ON public.inventory_stock_ledger
  FOR INSERT WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

-- =========================================================
-- ADJUSTMENTS (manual stock changes)
-- =========================================================
CREATE TABLE public.inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
  quantity_delta numeric(12,2) NOT NULL,
  reason text NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_adj_clinic ON public.inventory_adjustments(clinic_id);
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own clinic adjustments" ON public.inventory_adjustments
  FOR ALL USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

-- =========================================================
-- NUMBER GENERATORS
-- =========================================================
CREATE OR REPLACE FUNCTION public.generate_inventory_po_number(_clinic_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(po_number, '\D', '', 'g'), '')::int), 0) + 1
    INTO _next
  FROM public.inventory_purchase_orders
  WHERE clinic_id = _clinic_id;
  RETURN 'PO-' || LPAD(_next::text, 4, '0');
END;$$;

CREATE OR REPLACE FUNCTION public.generate_inventory_invoice_number(_clinic_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(invoice_number, '\D', '', 'g'), '')::int), 0) + 1
    INTO _next
  FROM public.inventory_invoices
  WHERE clinic_id = _clinic_id;
  RETURN 'INV-' || LPAD(_next::text, 4, '0');
END;$$;

-- =========================================================
-- RECEIVE PURCHASE ORDER (atomic)
-- Creates a batch per PO line and stock-ledger entries
-- =========================================================
CREATE OR REPLACE FUNCTION public.receive_purchase_order(_po_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _po RECORD;
  _item RECORD;
  _batch_id uuid;
BEGIN
  SELECT * INTO _po FROM public.inventory_purchase_orders WHERE id = _po_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'PO not found'; END IF;
  IF NOT public.can_manage_clinic_inventory(_po.clinic_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _po.status = 'received' THEN
    RAISE EXCEPTION 'PO already received';
  END IF;
  IF _po.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot receive a cancelled PO';
  END IF;

  FOR _item IN SELECT * FROM public.inventory_purchase_order_items WHERE po_id = _po_id LOOP
    INSERT INTO public.inventory_batches (
      clinic_id, product_id, po_id, batch_number, expiry_date,
      unit_cost, quantity_received, quantity_on_hand
    ) VALUES (
      _po.clinic_id, _item.product_id, _po.id, _item.batch_number, _item.expiry_date,
      _item.unit_cost, _item.quantity, _item.quantity
    ) RETURNING id INTO _batch_id;

    INSERT INTO public.inventory_stock_ledger (
      clinic_id, product_id, batch_id, change_qty, reason,
      reference_type, reference_id, created_by
    ) VALUES (
      _po.clinic_id, _item.product_id, _batch_id, _item.quantity, 'purchase',
      'purchase_order', _po.id, auth.uid()
    );
  END LOOP;

  UPDATE public.inventory_purchase_orders
    SET status = 'received', received_date = CURRENT_DATE
    WHERE id = _po_id;
END;$$;

-- =========================================================
-- ISSUE SALES INVOICE (atomic FEFO deduction)
-- =========================================================
CREATE OR REPLACE FUNCTION public.issue_sales_invoice(_invoice_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _inv RECORD;
  _item RECORD;
  _batch RECORD;
  _remaining numeric(12,2);
  _take numeric(12,2);
  _on_hand numeric(12,2);
BEGIN
  SELECT * INTO _inv FROM public.inventory_invoices WHERE id = _invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT public.can_manage_clinic_inventory(_inv.clinic_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _inv.status = 'issued' THEN
    RAISE EXCEPTION 'Invoice already issued';
  END IF;
  IF _inv.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot issue a cancelled invoice';
  END IF;

  -- Validate stock availability first
  FOR _item IN SELECT product_id, SUM(quantity) AS qty
               FROM public.inventory_invoice_items
               WHERE invoice_id = _invoice_id
               GROUP BY product_id LOOP
    SELECT COALESCE(SUM(quantity_on_hand), 0) INTO _on_hand
      FROM public.inventory_batches
      WHERE clinic_id = _inv.clinic_id AND product_id = _item.product_id;
    IF _on_hand < _item.qty THEN
      RAISE EXCEPTION 'Insufficient stock for product %, available: %, required: %',
        _item.product_id, _on_hand, _item.qty;
    END IF;
  END LOOP;

  -- Deduct FEFO
  FOR _item IN SELECT * FROM public.inventory_invoice_items WHERE invoice_id = _invoice_id LOOP
    _remaining := _item.quantity;

    FOR _batch IN
      SELECT * FROM public.inventory_batches
      WHERE clinic_id = _inv.clinic_id
        AND product_id = _item.product_id
        AND quantity_on_hand > 0
      ORDER BY (expiry_date IS NULL), expiry_date ASC, received_at ASC
    LOOP
      EXIT WHEN _remaining <= 0;
      _take := LEAST(_batch.quantity_on_hand, _remaining);

      UPDATE public.inventory_batches
        SET quantity_on_hand = quantity_on_hand - _take
        WHERE id = _batch.id;

      INSERT INTO public.inventory_stock_ledger (
        clinic_id, product_id, batch_id, change_qty, reason,
        reference_type, reference_id, created_by
      ) VALUES (
        _inv.clinic_id, _item.product_id, _batch.id, -_take, 'sale',
        'sales_invoice', _inv.id, auth.uid()
      );

      _remaining := _remaining - _take;
    END LOOP;
  END LOOP;

  UPDATE public.inventory_invoices
    SET status = 'issued'
    WHERE id = _invoice_id;
END;$$;

-- =========================================================
-- APPLY MANUAL ADJUSTMENT (atomic)
-- =========================================================
CREATE OR REPLACE FUNCTION public.apply_inventory_adjustment(
  _clinic_id uuid, _product_id uuid, _batch_id uuid,
  _delta numeric, _reason text, _notes text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _adj_id uuid;
  _on_hand numeric;
BEGIN
  IF NOT public.can_manage_clinic_inventory(_clinic_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _delta = 0 THEN RAISE EXCEPTION 'Delta cannot be zero'; END IF;

  IF _batch_id IS NOT NULL THEN
    SELECT quantity_on_hand INTO _on_hand FROM public.inventory_batches
      WHERE id = _batch_id AND clinic_id = _clinic_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Batch not found'; END IF;
    IF _on_hand + _delta < 0 THEN
      RAISE EXCEPTION 'Adjustment would make batch negative (on hand: %)', _on_hand;
    END IF;
    UPDATE public.inventory_batches
      SET quantity_on_hand = quantity_on_hand + _delta
      WHERE id = _batch_id;
  ELSE
    -- create a virtual batch for positive adjustments without batch
    IF _delta > 0 THEN
      INSERT INTO public.inventory_batches (
        clinic_id, product_id, batch_number, quantity_received, quantity_on_hand
      ) VALUES (
        _clinic_id, _product_id, 'ADJ-' || to_char(now(),'YYYYMMDDHH24MISS'),
        _delta, _delta
      ) RETURNING id INTO _batch_id;
    ELSE
      RAISE EXCEPTION 'Negative adjustment requires a batch';
    END IF;
  END IF;

  INSERT INTO public.inventory_adjustments (
    clinic_id, product_id, batch_id, quantity_delta, reason, notes, created_by
  ) VALUES (
    _clinic_id, _product_id, _batch_id, _delta, _reason, _notes, auth.uid()
  ) RETURNING id INTO _adj_id;

  INSERT INTO public.inventory_stock_ledger (
    clinic_id, product_id, batch_id, change_qty, reason,
    reference_type, reference_id, notes, created_by
  ) VALUES (
    _clinic_id, _product_id, _batch_id, _delta, 'adjustment',
    'adjustment', _adj_id, _notes, auth.uid()
  );

  RETURN _adj_id;
END;$$;
