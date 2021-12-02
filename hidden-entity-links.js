// 'use strict';
// import { libWrapper } from './shim.js';
const mod = 'hidden-entity-links';

export class Settings {
  static registerSettings() {
    game.settings.register(mod, 'hide-actors', {
      name: `${mod}.settings.hide-actors.name`,
      hint: `${mod}.settings.hide-actors.hint`,
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });
    game.settings.register(mod, 'hide-items', {
      name: `${mod}.settings.hide-items.name`,
      hint: `${mod}.settings.hide-items.hint`,
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });
    game.settings.register(mod, 'hide-journals', {
      name: `${mod}.settings.hide-journals.name`,
      hint: `${mod}.settings.hide-journals.hint`,
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });
    game.settings.register(mod, 'hide-rolltables', {
      name: `${mod}.settings.hide-rolltables.name`,
      hint: `${mod}.settings.hide-rolltables.hint`,
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    });
  }
}

Hooks.once('setup', async function () {
  Settings.registerSettings();
  // ========
  // Journal
  // ========
  if (game.settings.get(mod, 'hide-journals')) {
    libWrapper.register(
      mod,
      'JournalSheet.prototype._inferDefaultMode',
      function (wrapped, ...args) {
        if (this.object.limited && this.object.data.content) {
          return 'text';
        }
        return wrapped(...args);
      },
      'MIXED',
    );
  }
  // ========
  // Items
  // ========
  if (game.settings.get(mod, 'hide-items')) {
    libWrapper.register(
      mod,
      'Item.prototype.visible',
      function (wrapped, ...args) {
        return this.testUserPermission(game.user, 'OBSERVER');
      },
      'OVERRIDE',
    );
  }
  // ========
  // Actors
  // ========
  if (game.settings.get(mod, 'hide-actors')) {
    libWrapper.register(
      mod,
      'Actor.prototype.visible',
      function (wrapped, ...args) {
        if (game.user.isGM) {
          return true;
        }
        if (!this.getFlag(mod, 'hidden')) {
          return this.testUserPermission(game.user, 'OBSERVER');
        }
      },
      'OVERRIDE',
    );

    libWrapper.register(
      mod,
      'ActorDirectory.prototype._getEntryContextOptions',
      function (wrapped, ...args) {
        const options = SidebarDirectory.prototype._getEntryContextOptions.call(this);
        return [
          {
            name: game.i18n.localize(`${mod}.label.hide-actor`),
            icon: '<i class="far fa-lightbulb"></i>',
            condition: (li) => {
              const actor = game.actors.get(li.data('entityId'))
                ? game.actors.get(li.data('entityId'))
                : game.actors.get(li.data('documentId'));
              if (game.user.isGM && !actor.getFlag(mod, 'hidden')) {
                return true;
              } else {
                return false;
              }
            },
            callback: (li) => {
              const actor = game.actors.get(li.data('entityId'))
                ? game.actors.get(li.data('entityId'))
                : game.actors.get(li.data('documentId'));
              actor.setFlag(mod, 'hidden', true);
            },
          },
          {
            name: game.i18n.localize(`${mod}.label.show-actor`),
            icon: '<i class="fas fa-lightbulb"></i>',
            condition: (li) => {
              const actor = game.actors.get(li.data('entityId'))
                ? game.actors.get(li.data('entityId'))
                : game.actors.get(li.data('documentId'));
              if (game.user.isGM && actor.getFlag(mod, 'hidden')) {
                return true;
              } else {
                return false;
              }
            },
            callback: (li) => {
              const actor = game.actors.get(li.data('entityId'))
                ? game.actors.get(li.data('entityId'))
                : game.actors.get(li.data('documentId'));
              actor.setFlag(mod, 'hidden', false);
            },
          },
        ].concat(options);
      },
      'MIXED',
    );
  }
  // ========
  // Rolltable
  // ========
  if (game.settings.get(mod, 'hide-rolltables')) {
    libWrapper.register(
      mod,
      'RollTable.prototype.visible',
      function (wrapped, ...args) {
        return this.testUserPermission(game.user, 'OBSERVER');
      },
      'OVERRIDE',
    );
    libWrapper.register(
      mod,
      'RollTableConfig.defaultOptions',
      function (wrapped, ...args) {
        return foundry.utils.mergeObject(wrapped(...args), {
          viewPermission: CONST.ENTITY_PERMISSIONS.LIMITED,
        });
      },
      'WRAPPER',
    );
  }
});
