export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { Resource } = await import('@opentelemetry/resources');
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: 'ai-electrostore',
      }),
      // Captures Better Auth spans, Mongoose transactions, and Server Action latencies
    });

    try {
      sdk.start();
      console.log('🔭 OpenTelemetry instrumentation initialized for AI ElectroStore');
    } catch (error) {
      console.error('Failed to start OpenTelemetry SDK', error);
    }
  }
}
