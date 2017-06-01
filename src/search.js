const bcrypt = require('bcrypt');
const ldap   = require('ldapjs');

const {bind, unbind} = require('./util');

const client = ldap.createClient({
  url: 'ldap://localhost'
});

console.log('start.');
auth(client);

function compare(client, dn, attr, value) {
  return new Promise((resolve, reject) => {
    client.compare(dn, attr, value, (err, matched) => {
      if (err) {
        reject(err);
      } else {
        resolve(matched);
      }
    });
  });
}

function search(client, dn, opts) {
  return new Promise((resolve, reject) => {
    client.search(dn, opts, (err, res) => {
      if (err) {
        reject(err);
      } else {
        res.on('searchEntry', (entry) => {
          console.log(`entry: ${JSON.stringify(entry.object)}`);
        });
        res.on('searchReference', (referral) => {
          console.log(`referral: ${referral.uris.join()}`);
        });
        res.on('error', (err) => {
          reject(err);
        });
        res.on('end', (result) => {
          resolve(result);
        });
      }
    });
  });
}

async function auth(client) {
  await bind(client, 'cn=admin,dc=troy,dc=com', 'changeme');

  const salt         = '$2a$10$T21AKFhMmhCRxpncPWK3d.'
  const userPassword = await bcrypt.hash('001', salt);
  const matched      = await compare(client, 'uid=001,ou=internal,o=security_force,dc=troy,dc=com', 'userPassword', userPassword);
  console.log(`matched: ${matched}\n`);

  const opts = {
    scope: 'sub',
  };
  await search(client, 'dc=troy,dc=com', opts);

  await unbind(client);

  console.log('done.');
}
