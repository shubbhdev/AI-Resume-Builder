type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
type Insert = { contacts?: Json }
const x: Insert = { contacts: {} }
