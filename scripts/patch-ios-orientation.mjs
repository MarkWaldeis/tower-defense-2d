/**
 * After `npx cap add ios` / `npx cap sync`, lock the native iOS app to landscape.
 * Safe to re-run; no-ops when the ios project is not present yet.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const infoPlist = path.join(root, 'ios', 'App', 'App', 'Info.plist');

if (!fs.existsSync(infoPlist)) {
  console.log('[patch-ios-orientation] ios/App not found — run `npx cap add ios` first. Skipping.');
  process.exit(0);
}

let xml = fs.readFileSync(infoPlist, 'utf8');

const landscapeBlock = `	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>`;

const orientRegex =
  /<key>UISupportedInterfaceOrientations<\/key>\s*<array>[\s\S]*?<\/array>/;
const orientIpadRegex =
  /<key>UISupportedInterfaceOrientations~ipad<\/key>\s*<array>[\s\S]*?<\/array>/;

if (orientRegex.test(xml)) {
  xml = xml.replace(orientRegex, '').replace(orientIpadRegex, '');
  xml = xml.replace('</dict>\n</plist>', `${landscapeBlock}\n</dict>\n</plist>`);
  fs.writeFileSync(infoPlist, xml);
  console.log('[patch-ios-orientation] Locked Info.plist to landscape.');
} else {
  xml = xml.replace('</dict>\n</plist>', `${landscapeBlock}\n</dict>\n</plist>`);
  fs.writeFileSync(infoPlist, xml);
  console.log('[patch-ios-orientation] Added landscape orientation keys.');
}
