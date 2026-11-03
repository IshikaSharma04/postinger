# Database Backup & Disaster Recovery Runbook

## Automated Daily Backups
The automated backup job is executed via cron or task scheduler using `scripts/backup-database.sh`:

```bash
# Crontab schedule: run daily at 02:00 AM UTC
0 2 * * * cd /path/to/postinger && ./scripts/backup-database.sh >> /var/log/postinger-backup.log 2>&1
```

### Retention Policy
- Backups are stored compressed in `./backups/` with timestamped naming `postinger_db_YYYYMMDD_HHMMSS.sql.gz`.
- Backups older than 14 days are automatically pruned by `find -mtime +14 -delete`.

## Verified Restore Procedure
To restore a snapshot in the event of hardware failure or disaster recovery:

1. Locate the desired backup file in `./backups/`:
   ```bash
   ls -la backups/
   ```

2. Decompress the archive:
   ```bash
   gunzip -k backups/postinger_db_YYYYMMDD_HHMMSS.sql.gz
   ```

3. Restore into PostgreSQL:
   ```bash
   psql "$DATABASE_URL" < backups/postinger_db_YYYYMMDD_HHMMSS.sql
   ```

4. Verify table integrity:
   ```bash
   npx prisma db pull
   npm test
   ```
