#import "NativeImplementations.h"

#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

@implementation NativeImplementations

- (void)showConfirmDialog:(NSString *)title
                  message:(NSString *)message
              confirmText:(NSString *)confirmText
               cancelText:(NSString *)cancelText
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter == nil) {
      reject(@"NO_VIEW_CONTROLLER", @"Cannot show confirm dialog without a view controller", nil);
      return;
    }

    UIAlertController *alert =
        [UIAlertController alertControllerWithTitle:title
                                            message:message
                                     preferredStyle:UIAlertControllerStyleAlert];

    __block BOOL settled = NO;
    void (^settle)(BOOL) = ^(BOOL confirmed) {
      if (settled) {
        return;
      }
      settled = YES;
      resolve(@(confirmed));
    };

    [alert addAction:[UIAlertAction actionWithTitle:confirmText
                                              style:UIAlertActionStyleDefault
                                            handler:^(UIAlertAction *action) {
                                              settle(YES);
                                            }]];
    [alert addAction:[UIAlertAction actionWithTitle:cancelText
                                              style:UIAlertActionStyleCancel
                                            handler:^(UIAlertAction *action) {
                                              settle(NO);
                                            }]];

    [presenter presentViewController:alert animated:YES completion:nil];
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeNativeImplementationsSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"NativeImplementations";
}

@end
