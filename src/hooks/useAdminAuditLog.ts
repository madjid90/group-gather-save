import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export type AuditAction = 
  | 'admin_login'
  | 'admin_logout'
  | 'campaign_create'
  | 'campaign_update'
  | 'campaign_delete'
  | 'offer_create'
  | 'offer_update'
  | 'offer_delete'
  | 'user_update'
  | 'user_delete'
  | 'sms_send'
  | 'export_generate'
  | 'import_offers'
  | 'settings_update'
  | 'seo_page_create'
  | 'seo_page_update'
  | 'seo_page_delete';

interface AuditLogParams {
  action: AuditAction;
  targetTable?: string;
  targetId?: string;
  details?: Json;
}

export const useAdminAuditLog = () => {
  const logAction = async ({ action, targetTable, targetId, details }: AuditLogParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log audit action: No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_user_id: user.id,
          action,
          target_table: targetTable,
          target_id: targetId,
          details: details || {},
          user_agent: navigator.userAgent,
        }]);

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  return { logAction };
};
