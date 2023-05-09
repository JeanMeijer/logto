import {
  HookEvent,
  type Hook,
  type HookEvents,
  type HookConfig,
  type CreateHook,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockCreatedAtForHook,
  mockHook,
  mockHookList,
  mockNanoIdForHook,
  mockTenantIdForHook,
} from '#src/__mocks__/hook.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const hooks = {
  findAllHooks: async (): Promise<Hook[]> => mockHookList,
  insertHook: async (data: CreateHook): Promise<Hook> => ({
    ...mockHook,
    ...data,
  }),
  findHookById: async (): Promise<Hook> => mockHook,
  updateHookById: async (_: unknown, data: Partial<CreateHook>): Promise<Hook> => ({
    ...mockHook,
    ...data,
  }),
  deleteHookById: jest.fn(),
};

const tenantContext = new MockTenant(undefined, { hooks });

const hookRoutes = await pickDefault(import('./hook.js'));

describe('hook routes', () => {
  const hookRequest = createRequester({ authedRoutes: hookRoutes, tenantContext });

  it('GET /hooks', async () => {
    const response = await hookRequest.get('/hooks');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHookList);
    expect(response.header).not.toHaveProperty('total-number');
  });

  it('GET /hooks/:id', async () => {
    const response = await hookRequest.get(`/hooks/${mockNanoIdForHook}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
  });

  it('POST /hooks', async () => {
    const name = 'fooName';
    const events: HookEvents = [HookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(200);
    const generatedId = response.body.id as string;
    const generatedSigningKey = response.body.signingKey as string;

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      name,
      events,
      signingKey: generatedSigningKey,
      config,
      enabled: true,
      createdAt: mockCreatedAtForHook,
    });
  });

  it('POST /hooks should be able to create a hook with multi events', async () => {
    const name = 'anyName';
    const events: HookEvents = [HookEvent.PostSignIn, HookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(200);
    const generatedId = response.body.id as string;
    const generatedSigningKey = response.body.signingKey as string;

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      name,
      events,
      signingKey: generatedSigningKey,
      config,
      enabled: true,
      createdAt: mockCreatedAtForHook,
    });
  });

  it('POST /hooks should fail when no events are provided', async () => {
    const payload: Partial<Hook> = {
      name: 'hook_name',
      config: {
        url: 'https://example.com',
      },
    };
    await expect(hookRequest.post('/hooks').send(payload)).resolves.toHaveProperty('status', 422);
  });

  it('POST /hooks should fail when both `event` and `events` are provided', async () => {
    const payload: Partial<Hook> = {
      name: 'hook_name',
      event: HookEvent.PostRegister,
      events: [HookEvent.PostSignIn, HookEvent.PostResetPassword],
      config: {
        url: 'https://example.com',
      },
    };
    await expect(hookRequest.post('/hooks').send(payload)).resolves.toHaveProperty('status', 422);
  });

  it('POST /hooks should success when create a hook with the old payload format', async () => {
    const payload: Partial<Hook> = {
      event: HookEvent.PostRegister,
      config: {
        url: 'https://example.com',
      },
    };
    const response = await hookRequest.post('/hooks').send(payload);
    expect(response.status).toEqual(200);
    const generatedId = response.body.id as string;

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      event: HookEvent.PostRegister,
      events: [HookEvent.PostRegister],
      config: {
        url: 'https://example.com',
      },
    });
  });

  it('POST /hooks/:id/signing-key', async () => {
    const originalSigningKey = mockHook.signingKey;
    const response = await hookRequest.post(`/hooks/${mockNanoIdForHook}/signing-key`).send();
    expect(response.status).toEqual(200);

    const newSigningKey = response.body.signingKey as string;
    expect(originalSigningKey).not.toEqual(newSigningKey);
    expect(response.body).toEqual({
      ...mockHook,
      signingKey: newSigningKey,
    });
  });

  it('PATCH /hooks/:id', async () => {
    const name = 'newName';
    const events: HookEvents = [HookEvent.PostSignIn];
    const config: HookConfig = {
      url: 'https://new.com',
    };

    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ name, events, config, enabled: false });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockHook,
      name,
      events,
      config,
      signingKey: mockHook.signingKey,
      enabled: false,
    });
  });

  it('PATCH /hooks/:id should success when update a hook with multi events', async () => {
    const events = [HookEvent.PostSignIn, HookEvent.PostResetPassword];
    const response = await hookRequest.patch(`/hooks/${mockNanoIdForHook}`).send({ events });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      events,
    });
  });

  it('PATCH /hooks/:id should success when update a hook with the old payload format', async () => {
    const event = HookEvent.PostSignIn;
    const response = await hookRequest.patch(`/hooks/${mockNanoIdForHook}`).send({ event });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      event,
      events: [event],
    });
  });

  it('PATCH /hooks/:id with empty events list should fail', async () => {
    const invalidEvents: HookEvent[] = [];
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ events: invalidEvents });
    expect(response.status).toEqual(400);
  });

  it('PATCH /hooks should fail when both `event` and `events` are provided', async () => {
    const payload: Partial<Hook> = {
      event: HookEvent.PostRegister,
      events: [HookEvent.PostSignIn, HookEvent.PostResetPassword],
    };

    await expect(
      hookRequest.patch(`/hooks/${mockNanoIdForHook}`).send(payload)
    ).resolves.toHaveProperty('status', 422);
  });

  it('PATCH /hooks/:id should not update signing key', async () => {
    const newSigningKey = `New-${mockNanoIdForHook}`;
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ config: { signingKey: newSigningKey } });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
    expect(response.body.config.signingKey).not.toEqual(newSigningKey);
  });

  it('DELETE /hooks/:id', async () => {
    await expect(hookRequest.delete(`/hooks/${mockNanoIdForHook}`)).resolves.toHaveProperty(
      'status',
      204
    );
  });
});
