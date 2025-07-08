import ExpoModulesCore
import UIKit

@UIApplicationMain
class AppDelegate: ExpoAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Disable HTTP/3 to prevent network errors on certain networks.
        if #available(iOS 15.0, *) {
            URLSessionConfiguration.default.http3Enabled = false
            URLSessionConfiguration.ephemeral.http3Enabled = false
        }
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
} 