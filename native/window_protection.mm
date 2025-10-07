#include <napi.h>
#import <Cocoa/Cocoa.h>
#import <AppKit/AppKit.h>

Napi::Value SetWindowProtection(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Buffer expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Buffer<void*> buffer = info[0].As<Napi::Buffer<void*>>();
    NSView* view = *reinterpret_cast<NSView**>(buffer.Data());

    if (!view) {
        Napi::Error::New(env, "Invalid window handle").ThrowAsJavaScriptException();
        return env.Null();
    }

    NSWindow* window = [view window];

    if (!window) {
        Napi::Error::New(env, "Could not get window from view").ThrowAsJavaScriptException();
        return env.Null();
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        if ([window respondsToSelector:@selector(setSharingType:)]) {
            [window setSharingType:NSWindowSharingNone];
            NSLog(@"✅ Window sharing disabled (NSWindowSharingNone)");
        } else {
            NSLog(@"⚠️ setSharingType not available on this macOS version");
        }

        [window setLevel:NSScreenSaverWindowLevel];
        NSLog(@"✅ Window level set to NSScreenSaverWindowLevel");

        NSWindowCollectionBehavior behavior = NSWindowCollectionBehaviorCanJoinAllSpaces |
                                             NSWindowCollectionBehaviorStationary |
                                             NSWindowCollectionBehaviorFullScreenAuxiliary |
                                             NSWindowCollectionBehaviorIgnoresCycle;
        [window setCollectionBehavior:behavior];
        NSLog(@"✅ Window collection behavior configured");

        [window setOpaque:NO];
        [window setBackgroundColor:[NSColor clearColor]];
        NSLog(@"✅ Window transparency configured");
    });

    return Napi::Boolean::New(env, true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "setWindowProtection"),
                Napi::Function::New(env, SetWindowProtection));
    return exports;
}

NODE_API_MODULE(window_protection, Init)