# scrape

## Requirements:

1. phantomjs
2. tor

## Usage with tor:

1. Create a file with List of URL's (E.g: bogota-urologos.txt)
2. Tor uses `9050` port by default.

Note: In case tor browser installed, then tor used 9150

`nohup ../phantomjs/bin/phantomjs --proxy=127.0.0.1:9050 --proxy-type=socks5 scrape.js bogota-urologos.txt &> bogota.log`
