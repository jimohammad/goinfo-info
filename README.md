# GoInfo

Free browser tools at [goinfo.info](https://goinfo.info) — visa forms, checklists, batch printing, and study directories.

## Local setup

1. Serve the folder with any static/PHP host (Apache/Nginx + PHP for API routes).
2. Copy `config/database.example.php` to `config/database.php` and set your MySQL credentials (or use env vars `GOINFO_DB_*`).
3. Open `index.html` for the app catalog.

## Deploy

Upload changed server files to goinfo.info. Do not upload `.cursor/` or `graphify-out/`.

## License

Private project by Iqbal Sons / Javid Iqbal unless noted otherwise.
