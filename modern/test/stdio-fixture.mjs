import { FederationReader } from '../src/gateway.mjs';
import { startStdio } from '../src/server.mjs';
import { fixtureFetch } from './fixture.mjs';
await startStdio(new FederationReader(fixtureFetch()));
