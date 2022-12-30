use faro;
INSERT IGNORE INTO KWL_APP (stack_id, name, app_key, created_by) VALUES (1, "web-app",  "abcd123", "init script");
INSERT IGNORE INTO CORS_ALLOWED_ORIGINS (origin_url, kwl_app_id)
  SELECT "http://localhost:8080", id FROM KWL_APP WHERE name="web-app";