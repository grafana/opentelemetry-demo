const { NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '' } =
  typeof window !== 'undefined' ? window.ENV : {};

// tracing.js
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Resource }  from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const Honeycomb = () => {
  const exporter = new OTLPTraceExporter({
    url: NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  });
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'browser',
    }),
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({
    contextManager: new ZoneContextManager()
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({
        eventNames: ['submit', 'click', 'keypress'],
      }),
    ],
  });
};

export default Honeycomb;