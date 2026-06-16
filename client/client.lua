local shutdownDone = false

AddEventHandler('playerSpawned', function()
    if not shutdownDone then
        shutdownDone = true
        ShutdownLoadingScreenNui()
    end
end)
