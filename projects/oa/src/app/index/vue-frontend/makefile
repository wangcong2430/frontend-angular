inject-wbp_oa-css:
	node_modules/.bin/tailwindcss -c tailwind.config.js -o projects/wbp_oa_frontend/inject-tailwind.css
	cp projects/wbp_oa_frontend/inject-tailwind.css dist/wbp_oa_frontend/assets/
	node_modules/.bin/lessc projects/wbp_oa_frontend/inject-modal.less projects/wbp_oa_frontend/inject-modal.css
	cp projects/wbp_oa_frontend/inject-modal.css dist/wbp_oa_frontend/assets/
	echo "Inject modal css file now is under dist/wbp_oa_frontend/assets/inject-modal.css."
