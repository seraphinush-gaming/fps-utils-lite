'use strict';

const DefaultSettings = {
  "mode": 0,
  "guild": false,
  "party": false,
  "hide_hit": false,
  "hide_projectiles": false,
  "hide_summons": false,
  "hide_myHit": false,
  "hide_myProjectiles": false,
  "hide_mySummons": false,
  
  "hide_actionScript": false,
  "hide_deathAnim": false,
  "hide_drunkScreen": false,
  "hide_fireworks": false,
  "hide_glm": false,

  "hide_dropitem": false,
  "dropitem_list": [
    639, // speed mote
    703, // dreamstorm, oneiric mote
    7214, // scroll of resurrection
    8000, 8001, 8002, 8003, 8004, 8005, // various hp and mp motes
    91344 // fashion coupon
  ]
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
        delete settings.hideFireworks;
        settings.hide_all_summons = settings.hideAllSummons;
        delete settings.hideAllSummons;
        settings.hide_my_summons = !settings.keepMySummons;
        delete settings.keepMySummons;
        settings.hide_projectiles = settings.hideProjectiles;
        delete settings.hideProjectiles;
        settings.hide_servants = settings.hideServants;
        delete settings.hideServants;
        settings.hit_me = settings.hitMe;
        delete settings.hitMe;
        settings.hit_other = settings.hitOther;
        delete settings.hitOther;
        settings.hit_damage = settings.hitDamage;
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
        break;
      case 7:
        delete settings.hide_camera_shake;
        delete settings.hide_servants;
        break;
      case 8:
        settings.hide_myProjectiles = false;
        delete settings.hit_damage;

        settings.hide_actionScript = settings.hide_action_script;
        delete settings.hide_action_script;
        settings.hide_deathAnim = settings.hide_death_anim;
        delete settings.hide_death_anim;
        settings.hide_drunkScreen = settings.hide_drunk_screen;
        delete settings.hide_drunk_screen;
        settings.hide_hit = settings.hit_other;
        delete settings.hit_other;
        settings.hide_myHit = settings.hit_me;
        delete settings.hit_me;
        settings.hide_summons = settings.hide_all_summons;
        delete settings.hide_all_summons;
        settings.hide_mySummons = settings.hide_my_summons;
        delete settings.hide_my_summons;
        break;
    }

    return settings;
  }
}

module.exports = MigrateSettings;