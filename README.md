### NOTE
This module is a simplified version of module `fps-utils` by Saegusae, Codeagon, Risenio, et al. and does not have all the features of the full module. for the full experience, please refer to the forks of the full module below.
- Support Codeagon : [![ko-fi](https://img.shields.io/badge/kofi-donate-333333.svg?colorA=F0AD4E&colorB=333333)](https://ko-fi.com/codeagon)
- Support Saegusae : [![patreon](https://img.shields.io/badge/patreon-donate-333333.svg?colorA=E85B46&colorB=333333)](https://www.patreon.com/saegusa)

---

```
Support seraph via donations, thanks in advance !
```

# fps-utils-lite [![](https://img.shields.io/badge/paypal-donate-333333.svg?colorA=0070BA&colorB=333333)](https://www.paypal.me/seraphinush) [![](https://img.shields.io/badge/patreon-pledge-333333.svg?colorA=F96854&colorB=333333)](https://www.patreon.com/seraphinush)
tera-toolbox module to help increase fps

## Auto-update guide
- Create a folder called `fps-utils-lite` in `tera-toolbox/mods` and download >> [`module.json`](https://raw.githubusercontent.com/seraphinush-gaming/fps-utils-lite/master/module.json) << (right-click this link and save link as..) into the folder

## Usage
- `fps`

### Arguments
- `actionscript`
  - Toggle screen script
- `all`
  - Show all users
- `deathanim`
  - Toggle death animation
- `dropitem`
  - Toggle select dropitem
  - `add <id | chat link>`
    - Add item to dropitem list
    - eg. `fps dropitem add <Essential Mana>`
  - `list` : Print dropitem list to console
  - `rm <id | chat link>`
    - Remove item from dropitem list
    - eg. `fps dropitem rm <Essential Mana>`
- `drunkscreen`
  - Toggle drunk screen abnormality
- `fireworks`
  - Toggle fireworks
- `glm`
  - Toggle Guardian Mission Legion UI
- `guild`
  - Toggle guild members
- `hit`
  - Toggle other user skill hit effect
  - `mine` : Toggle user skill hit effect
- `mode`
  - `0` : Disable FPS improvements
  - `1` : Disable projectiles and select skill effects
  - `2` : Disable all skill motion of other players
  - `3` : Hide all other players, takes priority over `guild` and `party` option
- `party`
  - Toggle party members
- `proj`
  - Toggle other user projectiles
  - `mine` : Toggle user projectiles
- `refresh`
  - Refresh spawned users
- `status`
  - Print settings
- `summons`
  - Toggle other user summons
  - `mine` : Toggles user summons
- `?`
  - Send command and arguments to chat

## Info
- Original developer : [Saegusae](https://github.com/Saegusae)
- Maintained by : [Codeagon](https://github.com/codeagon/fps-utils)
- Notable forks :
  - [Risenio's fork](https://github.com/Risenio/fps-utils)
  - [Snugglez's fork](https://github.com/Snugglez/fps-utils)
- Notable alternative : [fps-manager by SaltyMonkey](https://github.com/SaltyMonkey/fps-manager)

## Credit
- [Bernkastel](https://github.com/Bernkastel-0/)
- [Caali](https://github.com/hackerman-caali/)
- [Kasea](https://github.com/Kaseaa/)
- [Kyoukaya](https://github.com/kyoukaya)
- [Leyki](https://github.com/Leyki)
- [Pinkie](https://github.com/pinkipi/)
- [Saegusae](https://github.com/Saegusae/)
- [SaltyMonkey](https://github.com/SaltyMonkey)
- [SerenTera](https://github.com/SerenTera)

## Changelog
<details>

    1.0a
    - Fixed S_LOAD_TOPO issue
    - Replaced `hit other` option with `hit` option
    - Added `hit mine` option
    - Added `proj mine` option
    - Removed `hit damage` option
    - Removed `off` option
    - Removed `on` option
    1.09
    - Deprecated `camerashake` option
    - Deprecated `servants` option
    1.08
    - Added `glm` option
    1.07
    - Added `actionscript` option
    - Added `camerashake` option
    - Added `drunkscreen` option
    - Added fish aesthetic spawn block
    1.06
    - Added `deathanim` option
    - Added `dropitem` options
    1.05
    - Incorporated `tera-game-state`
    1.04
    - Added `all` option
    - Added `off` option
    - Added `on` option
    1.03
    - Fixed issue where S_SPAWN_USER could not load party members
    1.02
    - Fixed bugs
    1.01
    - Fixed bugs
    1.00
    - Initial fork and commit

</details>
