import {
  AppUpdate,
  AppUpdateAvailability,
  FlexibleUpdateInstallStatus,
} from '@capawesome/capacitor-app-update'

// A newer version on Google Play is offered through Play's own update UI (AR-20). The flexible flow
// downloads in the background while the player keeps playing; once it is downloaded the app
// installs it, which restarts the app. The current game is saved after every move, so it comes back.
export async function offerAppUpdate() {
  await AppUpdate.addListener('onFlexibleUpdateStateChange', ({ installStatus }) => {
    if (installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) void install()
  })

  const info = await AppUpdate.getAppUpdateInfo()
  // downloaded on an earlier launch, but the app was closed before it installed
  if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) return install()
  if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) return
  if (info.flexibleUpdateAllowed) await AppUpdate.startFlexibleUpdate()
  else if (info.immediateUpdateAllowed) await AppUpdate.performImmediateUpdate()
}

function install() {
  return AppUpdate.completeFlexibleUpdate().catch((error: unknown) =>
    console.warn('AppUpdate.completeFlexibleUpdate failed', error),
  )
}
