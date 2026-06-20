local shutdownDone = false

AddEventHandler('playerSpawned', function()
    TriggerServerEvent('l-loadingscreen:playerSpawned')

    if not shutdownDone then
        shutdownDone = true
        ShutdownLoadingScreenNui()
    end
end)
