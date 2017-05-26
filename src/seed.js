const assert = require('assert');

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
});

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
units.forEach((unit) => {
  client.add(`ou=${unit.ou},o=security_force,dc=troy,dc=com`, unit, (err) => {
    if (err instanceof EntryAlreadyExistsError) {
      console.log(`${unit.ou}: ${err.toString()}`);
    } else {
      assert.ifError(err);
    }
  });
});

const usersInternal = [
  {
    objectClass : 'inetOrgPerson',
    uid         : '001',
    cn          : 'Estele',
    sn          : 'Keady',
    userPassword: '001',
  },
  {
    objectClass : 'inetOrgPerson',
    uid        : '002',
    cn         : 'Teddie',
    sn         : 'Mahaddy',
    userPassword: '002',
  },
];
const usersExternal = [
  {
    objectClass : 'inetOrgPerson',
    uid        : '003',
    cn         : 'Torry',
    sn         : 'Maccari',
    userPassword: '003',
  },
  {
    objectClass : 'inetOrgPerson',
    uid         : '004',
    cn          : 'Tomlin',
    sn          : 'Paoloni',
    userPassword: '004',
  },
];
usersInternal.forEach((user) => {
  client.add(`uid=${user.uid},ou=internal,o=security_force,dc=troy,dc=com`, user, (err) => {
    if (err instanceof EntryAlreadyExistsError) {
      console.log(`${user.cn}: ${err.toString()}`);
    } else {
      assert.ifError(err);
    }
  });
});
usersExternal.forEach((user) => {
  client.add(`uid=${user.uid},ou=external,o=security_force,dc=troy,dc=com`, user, (err) => {
    if (err instanceof EntryAlreadyExistsError) {
      console.log(`${user.cn}: ${err.toString()}`);
    } else {
      assert.ifError(err);
    }
  });
});
