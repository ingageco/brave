FROM ubuntu:20.04
ENV LANG en_US.utf8

EXPOSE 5000

WORKDIR /root/
RUN apt-get update && \
    apt-get install -y locales build-essential gir1.2-gst-plugins-bad-1.0 git gobject-introspection \
        gstreamer1.0-libav gstreamer1.0-nice gstreamer1.0-plugins-bad gstreamer1.0-plugins-base \
        gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools \
        libcairo2-dev libgirepository1.0-dev pkg-config python3-gst-1.0 \
        python3-dev python3-pip curl && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 && \
    rm -rf /var/lib/apt/lists/* && \

RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh --output ~/miniconda.sh

COPY run.sh /root/run.sh
RUN bash ~/miniconda.sh -b -p /root/miniconda
RUN eval "$(/root/miniconda/bin/conda shell.bash hook)" && conda init && conda create -n brave python=3.6 pip conda

COPY requirements.txt requirements.txt
RUN eval "$(/root/miniconda/bin/conda shell.bash hook)" && conda activate brave && git clone https://github.com/bbc/brave.git && cd brave && pip install -r /root/requirements.txt

CMD ["bash", "/root/run.sh"]
