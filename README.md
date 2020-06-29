### NOTE

This module is a simplified version of module `fps-utils` by Saegusae, Codeagon, Risenio, et al. and does not have all the features of the full module. for the full experience, please refer to the forks of the full module below.

- Support Codeagon : [![ko-fi](https://img.shields.io/badge/kofi-donate-333333.svg?colorA=F0AD4E&colorB=333333)](https://ko-fi.com/codeagon)
- Support Saegusae : [![patreon](https://img.shields.io/badge/patreon-donate-333333.svg?colorA=E85B46&colorB=333333)](https://www.patreon.com/saegusa)

---

<p align="center">
<a href="https://discord.gg/dUNDDtw">
<img src="https://github.com/seraphinush-gaming/pastebin/blob/master/logo_ttb_trans.png?raw=true" width="200" height="200" alt="tera-toolbox, logo by Foglio" />
</a>
</p>

# fps-utils-lite [![paypal](https://img.shields.io/badge/paypal-donate-333333.svg?colorA=253B80&colorB=333333)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=B7QQJZV9L5P2J&source=url) [![paypal.me](https://img.shields.io/badge/paypal.me-donate-333333.svg?colorA=169BD7&colorB=333333)](https://www.paypal.me/seraphinush)

tera-toolbox module to help increase fps

```
Support seraph via paypal donations, thanks in advance !
```

## Auto-update guide

- Create a folder called `fps-utils-lite` in `tera-toolbox/mods` and download >> [`module.json`](https://raw.githubusercontent.com/seraphinush-gaming/fps-utils-lite/master/module.json) << (right-click this link and save link as..) into the folder

## Usage

- __`fps`__

### Arguments

- __`actionscript`__
  - Toggle screen zoom script hide/show
- __`all`__
  - Show all users
- __`camerashake`__
  - Toggle camera shake hide/show
- __`deathanim`__
  - Toggle death animation hide/show
- __`dropitem`__
  - Toggle dropitem hide/show
  - `add <id | chat link>` : Add `id` to dropitem list
  - `list` : Print dropitem list in console
  - `rm <id | chat link>` : Remove `id` from dropitem list
- __`drunkscreen`__
  - Toggle drunk screen abnormality hide/show
- __`fireworks`__
  - Toggle fireworks hide/show
- __`friends`__
  - Toggle friends hide/show
- __`glm`__
  - Toggle Guardian Mission Legion UI hide/show
- __`guild`__
  - Toggle guild members hide/show
- __`hide`__
  - Toggle friends, party, and guild hide/show
- __`hit`__
  - `damage` : Toggle user skill damage numbers hide/show
  - `me` : Toggle user skill hits hide/show
  - `other` : Toggle other player skill hits hide/show
- __`mode`__
  - `0` : Disable fps improvements
  - `1` : Set mode to 1, with projectiles hidden
  - `2` : Set mode to 2, with additional skill effects hidden
  - `3` : Set mode to 3, with additional players hidden
- __`on`__
- __`off`__
- __`party`__
  - Toggle party members hide/show
- __`proj`__
  - Toggle projectiles hide/show
- __`servants`__
  - Toggle partners and pets hide/show
- __`status`__
  - Print status of relevant variables
- __`summons`__
  - Toggle summons hide/show
  - `mine` : Toggles user summons hide/show

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
    1.09
    - Added `friends` option
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
