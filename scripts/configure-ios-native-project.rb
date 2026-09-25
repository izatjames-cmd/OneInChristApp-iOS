#!/usr/bin/env ruby

require 'fileutils'
require 'xcodeproj'

project_root = Dir.pwd
project_path = File.join(project_root, 'ios', 'App', 'App.xcodeproj')
app_dir = File.join(project_root, 'ios', 'App', 'App')
firebase_plist = File.join(app_dir, 'GoogleService-Info.plist')
entitlements_path = File.join(app_dir, 'App.entitlements')

abort "ERROR: Xcode project was not found: #{project_path}" unless File.exist?(project_path)
abort "ERROR: GoogleService-Info.plist was not found: #{firebase_plist}" unless File.exist?(firebase_plist)

FileUtils.mkdir_p(app_dir)

File.write(
  entitlements_path,
  <<~PLIST
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>aps-environment</key>
        <string>production</string>
    </dict>
    </plist>
  PLIST
)

project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |item| item.name == 'App' }
abort 'ERROR: Xcode target "App" was not found.' unless target

app_group =
  project.main_group.groups.find do |group|
    group.name == 'App' ||
      group.path == 'App' ||
      group.display_name == 'App'
  end

app_group ||= project.main_group.new_group('App', 'App')

firebase_ref = project.files.find { |file| file.path == 'GoogleService-Info.plist' }
firebase_ref ||= app_group.new_file('GoogleService-Info.plist')

unless target.resources_build_phase.files_references.include?(firebase_ref)
  target.resources_build_phase.add_file_reference(firebase_ref, true)
end

entitlements_ref = project.files.find { |file| file.path == 'App.entitlements' }
app_group.new_file('App.entitlements') unless entitlements_ref

target.build_configurations.each do |configuration|
  configuration.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end

attributes = project.root_object.attributes
target_attributes = attributes['TargetAttributes'] ||= {}
this_target_attributes = target_attributes[target.uuid] ||= {}
system_capabilities = this_target_attributes['SystemCapabilities'] ||= {}
system_capabilities['com.apple.Push'] = { 'enabled' => 1 }

project.save

puts 'iOS native project configured.'
puts '- GoogleService-Info.plist added to app resources'
puts '- Push Notifications capability enabled'
puts '- aps-environment entitlement set to production for Ad Hoc'
