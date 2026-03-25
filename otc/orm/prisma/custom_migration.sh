for file in prisma/views/*.sql prisma/routines/*.sql prisma/routines/*.psql; do
    echo "Running $file"
    npx prisma db execute --file="$file" --schema=./prisma/schema.prisma
done
