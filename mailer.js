var everypaas = require('everypaas');
var nodemailer = require('nodemailer');
var each = require('lodash.foreach');

module.exports = function (config) {
  /*
   * opening smtp connection
   */
  // Default to printing a warning
  var smtpTransport = {
    sendMail: function (opts, cb) {
      console.log('WARNING: no SMTP transport detected nor configured. Cannot send email.');
      cb(null, { message: null });
    }
  };

  // Try using SendGrid / Mailgun
  if (everypaas.getSMTP() !== null) {
    console.log('Using SMTP transport: %j', everypaas.getSMTP());
    smtpTransport = nodemailer.createTransport.apply(null, everypaas.getSMTP());
  } else {
    if (config.sendgrid) {
      console.log('Using Sendgrid transport from config');
      smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: config.sendgrid.username,
          pass: config.sendgrid.password
        }
      });
    } else if (config.smtp) {
      console.log('Using SMTP transport from config');
      var smtp = config.smtp;
      var smtpConfig = {
        host: smtp.host,
        port: parseInt(smtp.port, 10)
      };
      switch (true) {
        case (smtp.secure.toLowerCase() === "true"):
          smtpConfig.secureConnection = true;
          break;
        //check traditionally secured ports
        case (smtpConfig.port == (465 || 587)):
          if (smtp.secure.toLowerCase() === "false") {
            smtpConfig.secureConnection = false;
          } else {
            smtpConfig.secureConnection = true;
          }
          break;
        case (!smtp.secure):
          console.log('WARNING: no SMTP Secure not configured. Turn "false" by dafaults.');
          smtpConfig.secureConnection = false;
          break;
        default:
          smtpConfig.secureConnection = false;
          break;
      }

      // allow anonymous SMTP login if user and pass are not defined
      if (smtp.auth && smtp.auth.user && smtp.auth.pass) {
        smtpConfig.auth = {
          user: smtp.auth.user,
          pass: smtp.auth.pass
        };
      }

      smtpTransport = nodemailer.createTransport('SMTP', smtpConfig);
    } else if (config.stubSmtp) {
      console.log('stubbing smtp..');
      smtpTransport = nodemailer.createTransport('Stub');
    }
  }

  function send(to, subject, textBody, htmlBody, from, callback) {
    from = from || (config.smtp ? config.smtp.from : null);

    var mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: textBody, // plaintext body_template
      html: htmlBody // html body
    };
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log('Error sending email: ', error);
      }

      if (config.stubSmtp) {
        console.log(response.message);
      }

      if (callback) {
        callback(error, response);
      }
    });
  }

  /*
   * format_stdmerged()
   *
   * Format the stdmerged property (test std stream output) for sendgrid consumption.
   * <stdmerged> - Job's stdmerged property.
   */
  function format_stdmerged(stdmerged, emailFormat) {
    // 4k
    var start = stdmerged.length - 1 - 4096;

    if (start < 0) {
      start = 0;
    }

    var tlog = stdmerged.slice(start, stdmerged.length - 1).replace(/^\s+|\s+$/g,'');
    // Start each line with a space
    var tlines = tlog.split('\n');
    var b = new Buffer(8192);
    var offset = 0;

    each(tlines, function (l) {
      var towrite;

      if (emailFormat === 'plaintext') {
        towrite = ' ' + l.replace(/\[(\d)?\d*m/gi,'') + '\n';
      } else {
        towrite = ' ' + l.replace(/\[(\d)?\d*m/gi,'') + '<br>\n';
      }

      b.write(towrite, offset, towrite.length);
      offset += towrite.length;
    });

    return b.toString('utf8', 0, offset);
  }

  function elapsed_time(start, finish) {
    var inSeconds = (finish - start) / 1000;

    if (inSeconds > 60) {
      return (Math.floor(inSeconds / 60) + 'm ' + Math.round(inSeconds % 60) + 's');
    } else {
      return (Math.round(inSeconds) + 's');
    }
  }

  return {
    send: send,
    format_stdmerged: format_stdmerged,
    elapsed_time: elapsed_time
  };
};
