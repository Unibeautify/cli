#!/bin/bash
set -eu -o pipefail
os=$(uname | tr '[:upper:]' '[:lower:]')
[[ $os =~ (darwin|linux) ]] || exit 0
case "$*" in
before)
	url=https://codeclimate.com/downloads/test-reporter
	curl -L "${url}/test-reporter-latest-${os}-amd64" >./cc-test-reporter
	chmod +x ./cc-test-reporter
	./cc-test-reporter before-build
	;;
after)
	./cc-test-reporter after-build --exit-code "$TRAVIS_TEST_RESULT"
	;;
*)
	echo "usage: $0 before|after" >&2
	exit 1
	;;
esac
