# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM grafana/k6:0.48.0-with-browser

COPY ./src/loadgenerator/people.json /etc/people.json
COPY ./src/loadgenerator/script.js /etc/script.js
