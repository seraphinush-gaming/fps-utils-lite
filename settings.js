'use strict';

const DefaultSettings = {
  "mode": 0,
  "guild": false,
  "party": false,
  "hide_fireworks": false,
  "hide_all_summons": false,
  "hide_my_summons": false,
  "hide_death_anim": false,
  "hide_projectiles": false,
  "hide_dropitem": false,
  "dropitem_list": [
    639, // speed mote
    703, // dreamstorm, oneiric mote
    7214, // scroll of resurrection
    8000, 8001, 8002, 8003, 8004, 8005, // various hp and mp motes
    91344 // fashion coupon
  ],
  "hide_action_script": false,
  "hide_drunk_screen": false,
  "hide_glm": false,
  "hit_me": false,
  "hit_other": true,
  "hit_damage": false
};

function MigrateSettings(from_ver, to_ver, settings) {
  if (from_ver === undefined) {
    return Object.assign(Object.assign({}, DefaultSettings), settings);
  } else if (from_ver === null) {
    return DefaultSettings;
  } else {
    if (from_ver + 1 < to_ver) {
      settings = MigrateSettings(from_ver, from_ver + 1, settings);
      return MigrateSettings(from_ver + 1, to_ver, settings);
    }

    switch (to_ver) {
      case 2:
        settings.hide_fireworks = settings.hideFireworks;
        settings.hide_all_summons = settings.hideAllSummons;
        settings.hide_my_summons = !settings.keepMySummons;
        settings.hide_projectiles = settings.hideProjectiles;
        settings.hide_servants = settings.hideServants;
        settings.hit_me = settings.hitMe;
        settings.hit_other = settings.hitOther;
        settings.hit_damage = settings.hitDamage;
        delete settings.hideFireworks;
        delete settings.hideAllSummons;
        delete settings.keepMySummons;
        delete settings.hideProjectiles;
        delete settings.hideServants;
        delete settings.hitMe;
        delete settings.hitOther;
        delete settings.hitDamage;
        break;
      case 3:
        settings.hide_death_anim = false;
        break;
      case 4:
        settings.hide_dropitem = false;
        settings.dropitem_list = DefaultSettings.dropitem_list;
        break;
      case 5:
        settings.hide_action_script = false;
        settings.hide_camera_shake = false;
        settings.hide_drunk_screen = false;
        break;
      case 6:
        settings.hide_glm = false;
      case 7:
        delete settings.hide_camera_shake;
        delete settings.hide_servants;
    }

    return settings;
  }
}

module.exports = MigrateSettings;