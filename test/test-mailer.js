var expect = require('expect.js'),
  createMailer = require('../mailer'),
  defaultConfig = {};

describe('Mailer', function () {
  describe('#elapsed_time()', function () {
    var now = new Date(),
      start = now.getTime();

    it('should correctly determine elapsed time less than 60 seconds', function () {
      var finish = start + 30000,
        mailer = createMailer(defaultConfig),
        elapsedTime = mailer.elapsed_time(start, finish);

      expect(elapsedTime).to.be('30s');
    });

    it('should correctly determine elapsed time greater than 60 seconds', function () {
      var finish = start + 120000,
        mailer = createMailer(defaultConfig),
        elapsedTime = mailer.elapsed_time(start, finish);

      expect(elapsedTime).to.be('2m 0s');
    });
  });

  describe('#format_stdmerged()', function () {
    var std =
        '\n> string-crypt@0.0.1 pretest /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n> npm run-script lint; exit 0\n\n\n> string-crypt@0.0.1 lint /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n> ./node_modules/.bin/jshint . --reporter=./node_modules/jshint-full-path/index.js\n\n/Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d/node_modules/jshint-full-path\n\n> string-crypt@0.0.1 test /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n> ./node_modules/.bin/mocha -R spec -r should test/\n\n\n\u001b[0m\u001b[0m\n\u001b[0m  string-crypt\u001b[0m\n  \u001b[90m  ◦ should correctly encrpyt a string : \u001b[0m\n  \u001b[32m  ✓\u001b[0m\u001b[90m should correctly encrpyt a string  \u001b[0m\n\n\n\u001b[92m \u001b[0m\u001b[32m 1 passing\u001b[0m\u001b[90m (10ms)\u001b[0m\n\n',
      mailer = createMailer(defaultConfig);

    it('should correctly format std to html', function () {
      var formattedStd = mailer.format_stdmerged(std, 'html');
      expect(formattedStd).to.be(
        ' > string-crypt@0.0.1 pretest /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d<br>\n > npm run-script lint; exit 0<br>\n <br>\n <br>\n > string-crypt@0.0.1 lint /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d<br>\n > ./node_modules/.bin/jshint . --reporter=./node_modules/jshint-full-path/index.js<br>\n <br>\n /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d/node_modules/jshint-full-path<br>\n <br>\n > string-crypt@0.0.1 test /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d<br>\n > ./node_modules/.bin/mocha -R spec -r should test/<br>\n <br>\n <br>\n \u001b\u001b<br>\n \u001b  string-crypt\u001b<br>\n   \u001b  ◦ should correctly encrpyt a string : \u001b<br   \u001b  ✓\u001b\u001b should correctly encrpyt a string  \u001b<br <br>\n <br>\n \u001b \u001b\u001b 1 passing\u001b\u001b (10ms)\u001b<br>\n'
      );
    });

    it('should correctly format std to plain text', function () {
      var formattedStd = mailer.format_stdmerged(std, 'plaintext');
      expect(formattedStd).to.be(
        ' > string-crypt@0.0.1 pretest /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n > npm run-script lint; exit 0\n \n \n > string-crypt@0.0.1 lint /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n > ./node_modules/.bin/jshint . --reporter=./node_modules/jshint-full-path/index.js\n \n /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d/node_modules/jshint-full-path\n \n > string-crypt@0.0.1 test /Users/test/.strider/data/microadam-string-crypt-529b9eb147950e000000000d\n > ./node_modules/.bin/mocha -R spec -r should test/\n \n \n \u001b\u001b\n \u001b  string-crypt\u001b\n   \u001b  ◦ should correctly encrpyt a string :    \u001b  ✓\u001b\u001b should correctly encrpyt a string   \n \n \u001b \u001b\u001b 1 passing\u001b\u001b (10ms)\u001b\n'
      );
    });
  });

  describe('#send', function () {
    it('should execute default transport send function when no config set', function (done) {
      var mailer = createMailer(defaultConfig);
      mailer.send('to', 'subject', 'textBody', 'htmlBody', 'from', function (
        error,
        response
      ) {
        expect(response.message).to.be(null);
        done();
      });
    });

    it('should execute smtp transport send function when config.smtp set', function (done) {
      var mailer = createMailer({
        smtp: { from: 'test@test.com', auth: { user: 'test', pass: 'test' } },
      });
      mailer.send('to', 'subject', 'textBody', 'htmlBody', 'from', function (
        error,
        response
      ) {
        expect(error).to.be.ok();
        done();
      });
    });

    it('should execute sendgrid transport send function when config.sendgrid set', function (done) {
      var mailer = createMailer({
        sendgrid: { username: 'test', password: 'test' },
      });
      mailer.send('to', 'subject', 'textBody', 'htmlBody', 'from', function (
        error,
        response
      ) {
        expect(error.name).to.be('AuthError');
        done();
      });
    });
  });
});
