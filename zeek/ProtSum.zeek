module ProtSum;

export {
    # Create an ID for our new stream. By convention, this is
    # called "LOG".
    redef enum Log::ID += { LOG };

    # Define the record type that will contain the data to log.
    type Info: record {
        ts: time        &log;
        prot: string     &log;
        counter: count &log &default=0;
    };
    

event zeek_init() 
    {
    local filter : Log::Filter = 
    [
        $name="sqlite",
        $path="/var/db/pythia",
        $config=table(["tablename"]="prot_sum"),
        $writer=Log::WRITER_SQLITE
    ];
    Log::create_stream(ProtSum::LOG, [$columns=Info, $path="prot_sum"]);
    Log::add_filter(ProtSum::LOG, filter);
    }
}
