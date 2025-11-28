-- Add policy to allow users to insert their own clinic role
CREATE POLICY "Users can insert own clinic role"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) AND (role = 'clinic'::app_role));