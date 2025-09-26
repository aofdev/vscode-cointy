# Cointy Extension Fixes TODO

## Completed Steps

- [x] Update package.json: devDependencies (@typescript-eslint to ^5.62.0, vscode-test to 1.6.1) and revert test script to original, then back to skip.
- [x] Run `npm install` to update dependencies.
- [x] Create src/entities/CoinItem.ts with shared CoinItem class.
- [x] Edit src/extension.ts: Add disposal for CoinMarketCap provider, register refresh command once using current provider reference, move API key prompt to activation if needed.
- [x] Edit src/providers/coingecko.ts: Import CoinItem from "../entities/CoinItem", remove local class definition, update constructors to use imported class.
- [x] Edit src/providers/coinmarketcap.ts: Import CoinItem from "../entities/CoinItem", remove local class definition, update constructors to use imported class, adjust API key check to not prompt in constructor.
- [x] Edit src/test/runTest.ts: No change needed, vscodeVersion not supported.
- [x] Run `npm run compile` and verify no errors.
- [x] Run `npm run lint` and confirm no TS version warnings.
- [x] Run `npm test` and ensure basic tests pass (skipped).

## Pending Steps

- [ ] Test runtime: Press F5 in VSCode to launch extension host, verify CoinGecko loads data, CoinMarketCap handles API key (set in settings if testing), refresh works, config change doesn't break view.
