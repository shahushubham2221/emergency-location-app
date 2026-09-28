const fs = require('fs');
let txt = fs.readFileSync('src/pages/app/SOSActive.tsx', 'utf8');

const target = `  // Send alerts to trusted contacts (once per session)
  useEffect(() => {
    if (!session || !profile || alertsSentRef.current) return;
    if (contacts.length === 0) return;

    alertsSentRef.current = true;
    const location = currentLocation ?? lastKnownLocation ?? undefined;
    notifyContacts(profile, contacts, location)
      .then((results) => {
        setAlertResults(results);
        const opened = results.filter((r) => r.status === 'composer_opened').length;
        if (opened > 0) {
          addToast({
            type: 'info',
            message: \`SMS composer opened for \${opened} contact\${opened > 1 ? 's' : ''}. Please send to notify them.\`,
            duration: 8000,
          });
        }
      })
      .catch(() => {
        addToast({ type: 'warning', message: 'Could not open alert composer. Check your contacts.' });
      });
  }, [session, profile, contacts, currentLocation, lastKnownLocation]);`;

const replacement = `  // Send alerts to trusted contacts (once per session)
  useEffect(() => {
    if (!session || !profile || alertsSentRef.current) return;
    if (contacts.length === 0) return;

    const tryNotify = () => {
      if (alertsSentRef.current) return;
      alertsSentRef.current = true;
      const loc = useSOSStore.getState().currentLocation ?? useSOSStore.getState().lastKnownLocation ?? undefined;
      notifyContacts(profile, contacts, loc)
        .then((results) => {
          setAlertResults(results);
          const opened = results.filter((r) => r.status === 'composer_opened').length;
          if (opened > 0) {
            addToast({
              type: 'info',
              message: \`SMS composer opened. PLEASE TAP 'SEND' IN YOUR MESSAGING APP.\`,
              duration: 10000,
            });
          }
        })
        .catch(() => {
          addToast({ type: 'warning', message: 'Could not open alert composer. Check your contacts.' });
        });
    };

    if (currentLocation || lastKnownLocation) {
      tryNotify();
    } else {
      const timer = setTimeout(tryNotify, 4000); // wait up to 4s for GPS
      return () => clearTimeout(timer);
    }
  }, [session, profile, contacts, currentLocation, lastKnownLocation]);`;

const targetIndex = txt.indexOf('  // Send alerts to trusted contacts (once per session)');
const nextSection = txt.indexOf('  // Restore session from route state');

if (targetIndex !== -1 && nextSection !== -1) {
    txt = txt.substring(0, targetIndex) + replacement + '\n\n' + txt.substring(nextSection);
    fs.writeFileSync('src/pages/app/SOSActive.tsx', txt);
    console.log('Replaced successfully');
} else {
    console.log('Could not find target');
}
