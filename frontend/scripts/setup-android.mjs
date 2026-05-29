import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const androidRes = path.join(androidDir, 'app', 'src', 'main', 'res');

function writeFile(relPath, content) {
  const file = path.join(androidDir, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf-8');
  process.stdout.write(`  ${relPath} ✓\n`);
}

try {
  // Step 1: Add Android platform if missing
  if (!fs.existsSync(androidDir)) {
    process.stdout.write('→ Adding Android platform...\n');
    execSync('npx cap add android', { cwd: root, stdio: 'inherit' });
  }

  // Step 2: Copy icons from resources/
  process.stdout.write('→ Copying icons...\n');
  const srcDir = path.join(root, 'resources', 'android');
  const resDirs = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi', 'mipmap-anydpi-v26', 'drawable'];
  for (const dir of resDirs) {
    const src = path.join(srcDir, dir);
    const dest = path.join(androidRes, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }
  process.stdout.write('  icons ✓\n');

  // Step 3: Remove Capacitor-generated files that conflict with ours
  const toRemove = [
    path.join(androidRes, 'values', 'ic_launcher_background.xml'),
  ];
  for (const f of toRemove) {
    if (fs.existsSync(f)) {
      fs.rmSync(f);
      process.stdout.write(`  removed ${path.relative(androidDir, f)}\n`);
    }
  }

  // Step 4: Write AndroidManifest.xml with permissions
  writeFile('app/src/main/AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
</manifest>
`);

  // Step 5: Write colors.xml
  writeFile('app/src/main/res/values/colors.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#094f2a</color>
    <color name="colorPrimaryDark">#073d21</color>
    <color name="colorAccent">#60c000</color>
    <color name="splashBackground">#094f2a</color>
</resources>
`);

  // Step 6: Write splash drawable
  writeFile('app/src/main/res/drawable/splash.xml', `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashBackground" />
</layer-list>
`);

  // Step 7: Write styles.xml with splash theme
  writeFile('app/src/main/res/values/styles.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:windowSplashScreenBackground">@color/splashBackground</item>
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>
</resources>
`);

  // Step 9: Set overridePathCheck in gradle.properties
  const gp = path.join(androidDir, 'gradle.properties');
  let gradleProps = fs.readFileSync(gp, 'utf-8');
  if (!gradleProps.includes('android.overridePathCheck=true')) {
    gradleProps += '\nandroid.overridePathCheck=true\n';
    fs.writeFileSync(gp, gradleProps);
    process.stdout.write('  gradle.properties ✓\n');
  }

  process.stdout.write('\n✓ Android setup complete. Ready to build with: npx cap run android\n');
} catch (e) {
  console.error('Setup failed:', e);
  process.exit(1);
}
