module IPBytesSum;

export {
    # Create an ID for our new stream. By convention, this is
    # called "LOG".
    redef enum Log::ID += { LOG };

    # Define the record type that will contain the data to log.
    type Info: record {
        ts: time        &log;
        name: string     &log;
        counter: count &log &default=0;
    };
    

event zeek_init() 
    {
    local filter : Log::Filter = 
    [
        $name="sqlite",
        $path="/var/db/pythia_summary",
        $config=table(["tablename"]="ip_bytes_sum"),
        $writer=Log::WRITER_SQLITE
    ];
    Log::create_stream(IPBytesSum::LOG, [$columns=Info, $path="ip_bytes_sum"]);
    Log::add_filter(IPBytesSum::LOG, filter);
    }
}
