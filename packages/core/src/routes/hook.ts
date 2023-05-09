import { Hooks, hookEventsGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function hookRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { findAllHooks, findHookById, insertHook, updateHookById, deleteHookById } = queries.hooks;

  router.get(
    '/hooks',
    koaGuard({ response: Hooks.guard.array(), status: 200 }),
    async (ctx, next) => {
      ctx.body = await findAllHooks();

      return next();
    }
  );

  router.get(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findHookById(id);

      return next();
    }
  );

  router.post(
    '/hooks',
    koaGuard({
      body: Hooks.createGuard
        .omit({ id: true, name: true, signingKey: true, enabled: true, events: true })
        .extend({
          name: string().min(1).optional(),
          events: hookEventsGuard.nonempty().optional(),
        }),
      response: Hooks.guard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const { name, event, events, ...rest } = ctx.guard.body;

      const hasConflictEventFields = event && events;
      assertThat(
        !hasConflictEventFields,
        new RequestError({ code: 'hook.conflict_event_fields', status: 422 })
      );

      const eventsToCreate = events ?? conditional(event && [event]);
      assertThat(eventsToCreate, new RequestError({ code: 'hook.missing_events', status: 422 }));

      ctx.body = await insertHook({
        ...rest,
        id: generateStandardId(),
        /**
         * Note:
         * In the next hook update, the `name` field will be not nullable.
         * We need to ensure the new created hook name is not null or empty.
         */
        name: name ?? 'unnamed',
        event: event ?? null,
        events: eventsToCreate,
        signingKey: generateStandardId(),
        enabled: true,
      });

      return next();
    }
  );

  router.post(
    '/hooks/:id/signing-key',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await updateHookById(id, {
        signingKey: generateStandardId(),
      });

      return next();
    }
  );

  router.patch(
    '/hooks/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      body: Hooks.createGuard
        .omit({ id: true, name: true, signingKey: true, events: true })
        .deepPartial()
        .extend({
          // Note: make sure the user will not update the name to empty
          name: string().min(1).optional(),
          events: hookEventsGuard.nonempty().optional(),
        }),
      response: Hooks.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { event, events, config: configToUpdate, ...rest } = body;

      const hasConflictEventFields = event && events;
      assertThat(
        !hasConflictEventFields,
        new RequestError({ code: 'hook.conflict_event_fields', status: 422 })
      );

      const eventsToUpdate = events ?? conditional(event && [event]);

      const hook = await findHookById(id);
      const { config } = hook;

      ctx.body = await updateHookById(id, {
        ...rest,
        event: event ?? null,
        config: { ...config, ...configToUpdate },
        ...conditional(eventsToUpdate && { events: eventsToUpdate }),
      });

      return next();
    }
  );

  router.delete(
    '/hooks/:id',
    koaGuard({ params: z.object({ id: z.string().min(1) }), status: [204, 404] }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteHookById(id);
      ctx.status = 204;

      return next();
    }
  );
}
