type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
const obj = {}
const check: Json = obj // Does this fail?
