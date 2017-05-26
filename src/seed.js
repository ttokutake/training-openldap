const assert = require('assert');
const bcrypt = require('bcrypt');
const {List} = require('immutable');

const ldap = require('ldapjs');
const {
  EntryAlreadyExistsError
} = require('ldapjs');

const client = ldap.createClient({
  url: 'ldap://localhost'
});

client.bind('cn=admin,dc=troy,dc=com', 'changeme', (err) => {
  assert.ifError(err);
});

const organization = {
  objectClass: 'organization',
  o          : 'security_force',
}
client.add('o=security_force,dc=troy,dc=com', organization, (err) => {
  if (err instanceof EntryAlreadyExistsError) {
    console.log(`${organization.o}: ${err.toString()}`);
  } else {
    assert.ifError(err);
  }

  const units = [
    {
      objectClass: 'organizationalUnit',
      ou         : 'internal',
    },
    {
      objectClass: 'organizationalUnit',
      ou         : 'external',
    },
  ];
  Promise.all(units.map((unit) => {
    return new Promise((resolve, reject) => {
      client.add(`ou=${unit.ou},o=security_force,dc=troy,dc=com`, unit, (err) => {
        if (err instanceof EntryAlreadyExistsError) {
          console.log(`${unit.ou}: ${err.toString()}`);
        } else {
          assert.ifError(err);
        }
        resolve();
      });
    });
  }))
    .then((_) => {
      // NOTICE: salt is fixed for training!
      // const saltRounds = 10;
      // const salt       = bcrypt.genSaltSync(saltRounds);
      const salt = '$2a$10$T21AKFhMmhCRxpncPWK3d.'

      const users = List([
        {
          unit : 'internal',
          users: [
            {
              objectClass : 'inetOrgPerson',
              uid         : '001',
              cn          : 'Estele',
              sn          : 'Keady',
              userPassword: bcrypt.hashSync('001', salt),
            },
            {
              objectClass : 'inetOrgPerson',
              uid        : '002',
              cn         : 'Teddie',
              sn         : 'Mahaddy',
              userPassword: bcrypt.hashSync('002', salt),
            },
          ],
        },
        {
          unit : 'external',
          users: [
            {
              objectClass : 'inetOrgPerson',
              uid        : '003',
              cn         : 'Torry',
              sn         : 'Maccari',
              userPassword: bcrypt.hashSync('003', salt),
            },
            {
              objectClass : 'inetOrgPerson',
              uid         : '004',
              cn          : 'Tomlin',
              sn          : 'Paoloni',
              userPassword: bcrypt.hashSync('004', salt),
            },
          ],
        },
      ]);
      const promises = users
        .flatMap(({unit, users}) => {
          return users.map((user) => {
            return new Promise((resolve, reject) => {
              client.add(`uid=${user.uid},ou=internal,o=security_force,dc=troy,dc=com`, user, (err) => {
                if (err instanceof EntryAlreadyExistsError) {
                  console.log(`${user.cn}: ${err.toString()}`);
                } else {
                  assert.ifError(err);
                }
                resolve();
              });
            });
          });
        })
        .toJSON();
      Promise.all(promises)
        .then((_) => {
          client.unbind();
        });
    });
});
