import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const testPhone = '0600000000'
    const testEmail = `${testPhone}@switchly.temp`
    const testPassword = 'Test123!'

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail)

    if (existingUser) {
      // Assign admin role if not already
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', existingUser.id)
        .eq('role', 'admin')
        .single()

      if (!existingRole) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: existingUser.id, role: 'admin' })
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin user already exists',
          credentials: {
            phone: testPhone,
            password: testPassword
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        prenom: 'Admin',
        nom: 'Test',
        telephone: testPhone,
        ville: 'Paris',
        code_postal: '75001',
        contrats: 'les_deux'
      }
    })

    if (createError) {
      throw createError
    }

    // Assign admin role
    await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: newUser.user.id, role: 'admin' })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        credentials: {
          phone: testPhone,
          password: testPassword
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
