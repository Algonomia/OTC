## Requirement
Duplicate `.env.example` and rename it as `.env`.\
Your dabatase must be running to apply all those commands. (see [Step 1](../README.md#run-the-project) of the root project README.md)

## Migration
### Apply migration
To apply migration that haven't been launch yet
```bash
npm run deploy
npm run generate
```

### Create migration
To create a migration file
```bash
npm run migrate:dev
```
Enter the migration name
After applying all the needed change apply your migration as [above](#apply-migration)

### Reset database
To reset your database and migration
```bash
npm run reset-db
```

### Feed database
To feed your database launch
```bash
npm start
```