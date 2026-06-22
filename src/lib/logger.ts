export async function logActivity(userId: string, action: string, metadata?: any) {
  console.log(`[ACTIVITY LOG] User: ${userId} | Action: ${action}`, metadata ? metadata : '')
  // In a full production environment with migration access, we would insert this into an activity_logs table:
  // await supabase.from('activity_logs').insert({ user_id: userId, action, metadata })
}
