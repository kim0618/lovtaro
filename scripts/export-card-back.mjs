import { writeFileSync } from 'node:fs'
import { siteCardBackDefs, siteCardBackSvg, CARD_WIDTH, CARD_HEIGHT } from './lib/card-back-svg.mjs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH * 4}" height="${CARD_HEIGHT * 4}">
  <defs>${siteCardBackDefs()}</defs>
  ${siteCardBackSvg(CARD_WIDTH / 2, CARD_HEIGHT / 2, 1)}
</svg>`

writeFileSync('card-back.svg', svg)
console.log('Generated card-back.svg')
