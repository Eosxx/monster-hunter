// ==UserScript==
// @name         mhr怪物名称日语翻译
// @namespace    mhrisesb
// @version      1.2
// @description  将mhr怪物名称从日语翻译成中文
// @author       Eos
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @resource     monsterName https://raw.githubusercontent.com/Eosxx/monster-hunter/master/mhr_monster_name_local.json?1
// @match        *://kuroyonhon.com/mhrisesb/monster.php
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    const ICON_PATH = 'https://raw.githubusercontent.com/Eosxx/monster-hunter/master/'

    const MONSTER_NAME = JSON.parse(GM_getResourceText('monsterName'))

    function getMonster (name) {
      for (var i = 0; i < MONSTER_NAME.length; i++) {
        if (name === MONSTER_NAME[i].value) {
          return MONSTER_NAME[i]
        }
      }
      return {}
    }

    const resourceHtml = $('#container').html()

    let translationHtml = resourceHtml
    MONSTER_NAME.forEach(el => {
      if (el.value) {
        translationHtml = translationHtml.replace(RegExp(`(>)${el.match}(<)`, 'ig'), `$1${el.value}$2`)
      }
    })

    const bodyTitle = $('#container').children('#body').children('h1').text()
    if (bodyTitle === 'モンスター一覧') {
      const matchResult = /<h2>大型<\/h2>(.*)<h2>小型<\/h2>/.exec(translationHtml)

      if (matchResult) {
        const monsterList = $(`<div>${matchResult[0]}</div>`).find('a[href*="./monster/"]').toArray()

        const sortList = []

        monsterList.forEach(el => {
          const text = el.text
          const m = getMonster(text)
          sortList.push({
            sort: m.sort || '',
            icon: m.icon ? ICON_PATH + m.icon : '',
            htmlStr: el.outerHTML
          })
        })

        sortList.sort((a, b) => {
          if (a.sort === '') {
            return 1
          }
          if (b.sort === '') {
            return -1
          }
          return a.sort.charCodeAt() - b.sort.charCodeAt()
        })

        // add monster icon
        sortList.forEach(el => {
          el.htmlStr = `<img src="${el.icon}" width="50" height="50" referrerpolicy="no-referrer">${el.htmlStr}`
        })

        let monsterHtml = ''
        sortList.forEach(el => {
          monsterHtml = monsterHtml + el.htmlStr + '<br>'
        })

        translationHtml = translationHtml.replace(/(<h2>大型<\/h2>)(.*)(<h2>小型<\/h2>)/, `$1${monsterHtml}$3`)
      }

    }
    $('#container').html(translationHtml)

  })();
