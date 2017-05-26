const assert = require('assert');
const bcrypt = require('bcrypt');

const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldap://localhost'
});

client.bind('cn=admin,dc=troy,dc=com', 'changeme', (err) => {
  assert.ifError(err);
});

const salt         = '$2a$10$T21AKFhMmhCRxpncPWK3d.'
const userPassword = bcrypt.hashSync('001', salt);
client.compare('uid=001,ou=internal,o=security_force,dc=troy,dc=com', 'userPassword', userPassword, function(err, matched) {
  assert.ifError(err);

  console.log(`matched: ${matched}\n`);
});

const opts = {
  scope: 'sub',
};
client.search('dc=troy,dc=com', opts, (err, res) => {
  assert.ifError(err);

  res.on('searchEntry', (entry) => {
    console.log(`entry: ${JSON.stringify(entry.object)}`);
  });
  res.on('searchReference', (referral) => {
    console.log(`referral: ${referral.uris.join()}`);
  });
  res.on('error', (err) => {
    console.error(`error: ${err.message}`);
  });
  res.on('end', (result) => {
    console.log(`status: ${result.status}`);
    client.unbind((err) => {
      assert.ifError(err);
    });
  });
});
