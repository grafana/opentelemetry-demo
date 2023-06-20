use faro;
INSERT INTO KWL_APP (stack_id, name, app_key, created_by) VALUES (1, "web-app",  "abcd123", "init script");
INSERT INTO CORS_ALLOWED_ORIGINS (origin_url, kwl_app_id)
  SELECT "http://localhost:8080", id FROM KWL_APP WHERE name="web-app";
INSERT INTO CORS_ALLOWED_ORIGINS (origin_url, kwl_app_id)
  SELECT "http://localhost:8000", id FROM KWL_APP WHERE name="web-app";