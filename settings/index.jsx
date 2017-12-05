function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">Vortex Settings</Text>}>
           <Toggle settingsKey="showDigitalTime" label="Show Digital Time" />   
           <Toggle settingsKey="showDow" label="Show Day of the Week" />    
           <Toggle settingsKey="showDate" label="Show Date" />    
           <Toggle settingsKey="showBattery" label="Show Battery Charge" />    
           <Toggle settingsKey="showHeartRate" label="Show Heart Rate" />    
           <Toggle settingsKey="showSeconds" label="Show Seconds" />    
      </Section>        
    </Page>
  );
}

registerSettingsPage(mySettings);