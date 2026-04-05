run-local:
	docker-compose up --build -d

# Веб: базовый порт 3000; если занят — 3001+ (URL в логе). Свой порт: WEB_PORT=3010 make web
web:
	@cd front && npm run web

# Сборка как на GitHub Pages. Пример: make web-build-pages PUBLIC_PATH=/Tsyganestan/
PUBLIC_PATH ?= /Tsyganestan/
web-build-pages:
	@cd front && PUBLIC_PATH=$(PUBLIC_PATH) yarn web:build && touch dist/.nojekyll

# Копия проекта в ~/Tsyganestan-ascii-build + npm + pod install (обход кириллицы в пути для iOS).
ios-sync-ascii:
	@chmod +x scripts/sync-to-ascii-path.sh
	@./scripts/sync-to-ascii-path.sh

# Запуск симулятора iOS (при кириллице в пути — автоматически через ios-sync + ASCII-копию).
ios:
	@chmod +x scripts/ios-run.sh
	@cd front && bash ../scripts/ios-run.sh

# Сборка Android с JDK 17 из Homebrew (обход Java 25 / IBM_SEMERU).
android-assemble:
	@chmod +x scripts/android-build.sh
	@cd front && ../scripts/android-build.sh :app:assembleDebug
