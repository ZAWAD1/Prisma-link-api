// What to remove

1. Remove the "output = "../generated/prisma"
2. Change the provider to "provider = "prisma-client-js"

// Do after schema update.

1. npx prisma generate
2. npx prisma migrate dev --name init
3. npx prisma validate
