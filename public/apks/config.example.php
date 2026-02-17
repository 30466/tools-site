<?php
// Server-only configuration template.
//
// DO NOT commit real passwords to the repository.
//
// Deployment:
// 1) Copy this file to "config.php" on the server.
// 2) Fill in real passwords.
// 3) Ensure web access to config.php is blocked (e.g. Apache .htaccess / Nginx rules).

return [
    // Password for /apks/member_archive/upload.php
    'member_archive_password' => 'CHANGE_ME',

    // Password for /apks/abm48/upload.php
    'abm48_password' => 'CHANGE_ME',
];
