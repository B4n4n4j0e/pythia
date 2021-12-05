module ServiceSum;

export {
    # Create an ID for our new stream. By convention, this is
    # called "LOG".
    redef enum Log::ID += { LOG };

    # Define the record type that will contain the data to log.
    type Info: record {
        ts: time        &log;
        service: string     &log;
        counter: count &log &default=0;
    };
    

event zeek_init() 
    {
    local filter : Log::Filter = 
    [
        $name="sqlite",
        $path="/var/db/pythia",
        $config=table(["tablename"]="service_sum"),
        $writer=Log::WRITER_SQLITE
    ];
    Log::create_stream(ServiceSum::LOG, [$columns=Info, $path="service_sum"]);
    Log::add_filter(ServiceSum::LOG, filter);
    }
}
